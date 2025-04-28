## Welcome to the Boxphish tech test

#### Version 1.1.0

This technical test is designed to assess your ability to understand structured data, transform datasets, and produce an output that aligns with a predefined schema. The dataset provided includes various files containing randomly generated rows that represents a typical dump of stolen data found on the dark web. Your task is to interpret the files, understand the structure and requirements, and implement a solution that meets the project's goals.

There are no restrictions on the tools, libraries, or programming languages you choose to use. The approach you take is entirely up to you, and you are encouraged to make decisions that you believe are most effective and efficient. Your solution should demonstrate your problem-solving skills and attention to detail.

Please include any instructions or notes necessary for running your solution, along with any assumptions or decisions made during the process.

Pseudocode is acceptable, as long as it is clear and well-structured - we are testing your understanding of the problem and the way you would tackle the solution, not a full end-to-end solution. You may also include any additional files or documentation that you believe would be helpful in understanding your solution.

### Project goals

- Read the provided datasets (`files/users.csv`, `files/users.json`, `files/users.sql`) and extract the information.
- Transform the data to match the predefined CSV schema (`schema/csv.output.json`), and **create a new CSV file** with the transformed data bound to the columns found in the schema.
- Include comments and documentation where necessary to explain your thought process and implementation.

### About the data

The datasets are made to look like a dump of users from databases that have been breached and published onto the dark web. None of the data is real and has been generated for the purpose of this test, but strongly resembles the type of data that might be found in a real-world scenario.

_Please note that the files are not guaranteed to be in the same format or structure. How would your solution handle with dealing with very different file structures? Would you use a library or tool to help with this? If so, which one and why?_

### Bonus points

- Explain how you would approach this task if the files were to contain millions, or even billions of rows. Would your solution scale? If not, what changes would you make?
- Some of the rows in the data contain errors, missing information, or in some cases missing passwords. How would you handle these situations in your solution?

### Available files:

```
.
├── README.md
├── files
│   ├── supplementary
│   │   └── rainbow_table.csv
│   └── users.csv
│   └── users.json
│   └── users.sql
└── schema
    └── csv.output.json
```
