const express = require('express')
const Database = require('./database');
const branch = require('git-branch');
const child_process = require('child_process');

const app = express();
const port = 3333;

const database = new Database();

database.init();

app.use(express.static('public'));
app.use(express.json()) 

app.post('/add', (req, res) => {
	const newRepoData = req.body;

	try {
		const name = branch.sync(newRepoData.dir);
		newRepoData.branch = name;
	} catch (e) {
		console.log(`Git repo not found in ${newRepoData.dir}`);
	}

	database.add.call(database, newRepoData)
		.then(result => res.send(result))
		.catch(err => res.status(500).send(err));
});

app.post('/updateOne', (req, res) => {
	database.updateOne(
		req.body.id,
		req.body.key,
		req.body.value
	)
	.then((result) => {
		res.send(result);
	})
	.catch((err) => {
		console.error(err);
		res.status(500).send(err);
	});
});

app.get('/updateAll', (req, res) => {
	database.updateAll()
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(err);
		});
});

app.post('/updateListOrder', (req, res) => {
	database.updateListOrder(req.body)
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(err);
		});
});

app.get('/getRepoList', (req, res) => {
	database.getAll.call(database)
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(err);
		});
});

app.get('/remove', (req, res) => {
	database.remove(req.query.id)
		.then((result) => {
			res.send(result);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(err);
		});
});

app.post('/openCmd', (req, res) => {
	const { dir } = req.body;
	var child_process = require('child_process');
	if (dir) {
		try {
			child_process.exec(`start cmd.exe /k "cd /d ${dir}"`);
			res.send(`Directory ${dir} opened in another window.`);
		} catch (e) {
			res.status(500).send(`Cannot open ${dir}:`, e);
		}
	} else {
		res.status(500).send(`Directory wasn't specified`);
	}
});


app.listen(port, () => {
	console.log(`Branch Monitor is listening at http://localhost:${port}`)
});
