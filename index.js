const util = require('util')
const exec = util.promisify(require('child_process').exec)
const parse_walks = `pipenv run python3 ./parse_gps_data.py ./gps_dataset.csv ./walks/public/walks.json`
const show_walk_summaries = `npm start --prefix ./walks`

function run(command) {
  return async function() {
    const { stdout, stderr } = await exec(command)
    console.log(stdout)
    console.error(stderr)
  }
}


Promise.resolve()
  .then(() => console.info("Parsing walks from GPS data..."))
  .then(run(parse_walks))
  .then(() => console.info("Displaying walk summaries at: http://localhost:3000/"))
  .then(run(show_walk_summaries))
