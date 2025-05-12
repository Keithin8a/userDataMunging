# Running the Project

- First of all you will need to run `npm install` at the top level directory
- Next run the command `npm run setup` this will initialise the msql database
  - Note this script will install msql to your terminal
- To generate the output file `npm start`.
- After you are finished feel free to teardown the database by running `npm run teardown`.

## Bonus Points

With regards to the optimisation point, this solution wouldn't scale to millions of rows. I have put comments in the code with `TODO` to highlight what
I would do to optimise it and some justifications as to why I didn't for this solution.

In terms of the invalid data, there are two ways that I considered.
First - you could stored rows that didn't have valid data in a seperate file and manually correct the data. But this would be inefficient and costly.
Second (chosen solution) - Some manual investigation into the data is needed anyway, we are already having to write bespoke code for each dataset so writing code to go fetch the missing data is the most cost efficient.

## Next steps

This project is all in one file, whilst it was great for getting everything setup and debugging, each dataset should have it's own file.

I have a rule of 3, where is I have top reuse some code 3 or more times then I refactor it into a utility function. With the solution there wasn't really much need to do this, but if it was a real solution you could assume things like reading in a csv file etc... would need to be reusable.

Using typescript and having some unit tests would also be something I would work on as this makes the developer experience better and helps reduce potential errors.

## Troubleshooting

If for some reason it doesn't generate, I have included the output that was generated on my computer in the folder `/files/sampleOutput/output.csv`
