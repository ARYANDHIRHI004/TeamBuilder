// import fs from 'fs'
// import csv from 'csv-parser'

// const results:any = []

// export default function csvParser(req: any, res: any, next: any) {
//   fs.createReadStream('data.csv')
//     .pipe(csv())
//     .on('data', (data: any) => results.push(data))
//     .on('end', () => {
//       console.log('CSV successfully processed:')
//       console.log(results)
//       // output: [{ NAME: 'Daffy Duck', AGE: '24' }, ...]
//     })
//     .on('error', (error: any) => {
//       console.error('Error reading CSV:', error.message)
//     })
// }
