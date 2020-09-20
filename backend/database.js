const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const branch = require('git-branch');

class Database {
	constructor() {
		this.db;
	}

	connect() {
		this.db = new sqlite3.Database(path.resolve(__dirname, 'branch-monitor.db'), (err) => {
			if (err) {
				return console.error(err.message);
			}
		});
	}
	
	close() {
		this.db.close(err => err ? console.error(err.message) : null);
	}
	
	init() {
		this.connect();
		this.db.run(`
			CREATE TABLE IF NOT EXISTS
				repo_list(id, name, branch, dir)
			`);
		this.close();
	}

	add(data) {
		this.connect();
		return new Promise((resolve, reject) => {
			this.db.run(`
				INSERT INTO
					repo_list(id, name, branch, dir)
				VALUES('${data.id}', '${data.name}', '${data.branch}', '${data.dir}')
			`, (err) => {
				if (err) {
					reject(err.message);
				} else {
					resolve('Repo added successfully');
				}
				this.close();
			});
		});

	}
	
	getAll(keepConnection) {
		this.connect();
		return new Promise((resolve, reject) => {
			this.db.all(`SELECT * FROM repo_list ORDER BY id`, (err, rows) => {
				if (err) {
					reject(err.message);
				} else {
					resolve(rows);
				}
			});
			if (!keepConnection) this.close();
		});
	}

	updateAll() {
		this.connect();
		return new Promise(async (resolve) => {
			const rows = await this.getAll(true);

			for (let row of rows) {
				let name = '';
				try {
					name = branch.sync(row.dir);
				} catch (e) {
					console.log(`Git repo not found in ${row.dir}`);
				}
				this.db.run(`UPDATE repo_list SET branch = '${name}' WHERE id = '${row.id}'`);
				resolve('Row updated');
			}
			this.close();
		});
	}

	remove(id) {
		this.connect();
			return new Promise(resolve => {
				this.db.run(`DELETE FROM repo_list WHERE id = '${id}'`, (err) => {
					if (err) {
						reject(err.message);
					} else {
						resolve('Repo removed successfully');
					}
					this.close();
				});
			});
	}
}

module.exports = Database;
