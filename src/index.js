const fs = require("fs");
const {readFile, writeFile} = require('fs/promises');
const {parse} = require("csv-parse");
const mysql = require('mysql2/promise');
const Ajv = require('ajv/dist/2020');
const addFormats = require("ajv-formats");
const schema = require('../schema/csv.output.json');
const { json2csv } = require('json-2-csv');

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(schema);

const createRainbowTable = async () => {
    const rainbowTable = {}

    const reader = fs.createReadStream("./files/supplementary/rainbow_table.csv")
                     .pipe(parse())

    for await (const row of reader){
        //We don't need error handling here because if there are duplicates
        //the plain text password would be the same anyway.
        rainbowTable[`${row[0]}`] = row[1];
    }
    
    return rainbowTable
}

const getConnection = async () => {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'node_user',
        password: 'your_password',
        database: 'users'
    });
}

const closeConnection = async (connection) => {
    await connection.end()
}

const getUserWithLatestIP = async (connection, uuid) => {
    const query = `
        SELECT 
            u.username,
            u.password_hash,
            u.address, 
            u.city, 
            u.state, 
            u.country, 
            u.postal_code, 
            ulh.ip_address 
        FROM users u
        LEFT JOIN user_login_history ulh 
            ON u.id = ulh.user_id 
        WHERE 
            u.uuid = '${uuid}'
        ORDER BY ulh.login_timestamp DESC LIMIT 1;
    `;
  
    try {
      const [rows] = await connection.execute(query, [uuid, uuid]);
      return rows[0] || {};
    } catch (err) {
      console.error(`Error fetching uuid ${uuid}:`, err);
      return {};
    }
  }

const mapCSVRecordToSchema = (row, rainbowTable, index) => {
    
    //Some names have the title prefixed as part of the full name, we don't need this
    const titleCheck = row[4].split('. ');
    const santitizedName = titleCheck.length > 1 ? titleCheck.splice(1).join(' ') : titleCheck[0];

    const [first_name, family_name] = santitizedName.split(' '); //This removes jr. from the name which should be fine since it's not part of the family name

    const password = row[5] === "" ? rainbowTable[row[6]] : row[5];
    const output = {
        breach_record_id: index,
        username: row[1],
        first_name,
        family_name,
        password,
        hash: row[6],
        salt: undefined, //keep missing fields in the code just incase the dataset changes
        email: row[7],
        gender: row[8],
        dob: row[9],
        address: row[10],
        ip: row[12],
        secret_question_one: row[13],
        secret_answer_one: row[14],
        secret_question_two: undefined,
        secret_answer_two: undefined,
        secret_question_three: undefined,
        secret_answer_three: undefined
    }

    //santitize output
    Object.keys(output).forEach(key => {
        if (output[key] === undefined) {
            delete output[key];
        }
    });

    return output;
}

const mapJSONRecordToSchema = async (connection, row, index) => {
    const {uuid, full_name, password, email, gender: genderShort, date_of_birth: dob_ms} = row
    const {username, password_hash: hash, address, city, state, country, postal_code, ip_address} = await getUserWithLatestIP(connection, uuid);

    const [first_name, family_name] = full_name.split(' ');

    const output = {
        breach_record_id: index,
        username,
        first_name,
        family_name,
        password,
        hash,
        salt: undefined, //keep missing fields in the code just incase the dataset changes
        email,
        gender: genderShort === 'M' ? 'Male' : genderShort === 'F' ? 'Female' : 'Other',
        dob: new Date(dob_ms).toISOString().split('T')[0],
        address: `${address}, ${city}, ${state}, ${country}, ${postal_code}`,
        ip: ip_address || undefined,
        secret_question_one: undefined,
        secret_answer_one: undefined,
        secret_question_two: undefined,
        secret_answer_two: undefined,
        secret_question_three: undefined,
        secret_answer_three: undefined
    }

    //santitize output
    Object.keys(output).forEach(key => {
        if (output[key] === undefined) {
            delete output[key];
        }
    });

    return output;
}

const processCSV = async (rainbowTable, outputJSON) => {
    const reader = fs.createReadStream("./files/users.csv")
                     .pipe(parse({from_line: 2}))
                     
    for await (const row of reader){
        //TODO: create a writable stream to make this scale to millions of rows
        outputJSON.push(mapCSVRecordToSchema(row, rainbowTable, outputJSON.length+1))
    }
}

const processJSON = async (connection, outputJSON) => {
    //TODO: I couldn't get read stream to work for json files and I didn't want to spend
    //a long time on it, but streaming in each row would be the only way to make this scalable
    const reader = await readFile("./files/users.json", {encoding: 'utf8'})

    for await (const row of reader.split('\n')){
        if(row === '') return // escape if row is ever empty
        //TODO: create a writable stream to make this scale to millions of rows
        outputJSON.push(await mapJSONRecordToSchema(connection, JSON.parse(row), outputJSON.length + 1))
    }
}

(async () => {
    const databaseConnection = await getConnection();
    try {
        const rainbow_table = await createRainbowTable()  
        const outputJSON = [];

        //TODO: we could make the writable stream at this level and pass it in, that way we could
        //try to parrellise these two functions.
        //Prematurely optimising this however would make the data more difficult to debug
        //which was more important for this exercise
        await processCSV(rainbow_table, outputJSON);
        await processJSON(databaseConnection, outputJSON);
        
        const valid = await validate(outputJSON);

        if(valid) {
            const csv = json2csv(outputJSON);
            await writeFile('./files/output.csv', csv, 'utf-8')
        }
    } catch (e) {
        console.error(e)
    } finally {
        closeConnection(databaseConnection);
    }
})()