import getTime from './getTime';
import colors, { getNextColor } from './colors';

export default class List {
	constructor(rootId, templateId) {
		this.templateElement = document.getElementById(templateId);
		this.template = document.importNode(this.templateElement.content, true);
		this.root = document.getElementById(rootId);
		this.repoList = [];
		this.lastUpdate = '';

		this.update(true);
	}

	async update(shouldRenderAfterUpdate) {
		await fetch('/updateAll');
		if (shouldRenderAfterUpdate) {
			this.lastUpdate = getTime();
			this.render();
		}
	}

	async render() {
		const newElement = this.template.firstElementChild.cloneNode(true);
		const tableRow = newElement.querySelector('[data-table-row]');

		const response = await fetch('/getRepoList');
		this.repoList = await response.json();

		for (let repo of this.repoList) {
			// Add rows
			const newRow = tableRow.cloneNode(true);

			newRow.querySelector('[data-cell="name"]').textContent = repo.name;
			newRow.querySelector('[data-branch-name]').textContent = repo.branch;
			newRow.querySelector('[data-cell="dir"]').textContent = repo.dir;

			newRow.querySelector('[data-button-remove]').addEventListener('click',
				() => this.remove(repo.id)
			);

			newRow.querySelector('[data-button-open]').addEventListener('click',
				() => this.openCmd(repo.dir)
			);

			if (repo.branch) {
				const pill = newRow.querySelector('[data-branch-name]');
				switch (Number(repo.color)) {
					case colors.ORANGE:
						pill.classList.add('pill--orange');
						break;
					case colors.BLUE:
						pill.classList.add('pill--blue');
						break;
					case colors.GREEN:
						pill.classList.add('pill--green');
						break;
					case colors.DARK:
						pill.classList.add('pill--dark');
						break;
					case colors.AQUA:
						pill.classList.add('pill--aqua');
						break;
					case colors.RED:
						pill.classList.add('pill--red');
						break;
					case colors.GRAY:
						pill.classList.add('pill--gray');
						break;
					default:
						break;
				}
				pill.addEventListener('click', () => {
					this.updateRow(
						repo.id,
						'color',
						getNextColor(repo.color)
					);
				});
			} else {
				// Gray out the row
				newRow.classList.add('table__row--inactive');
			}

			// Append rows
			tableRow.insertAdjacentElement('afterend', newRow);
		}

		// Update last update time
		newElement.querySelector('[data-last-update]').textContent = this.lastUpdate;

		// Remove the first table template's row
		tableRow.parentNode.removeChild(tableRow);

		// Attach updated table to the DOM
		this.attach(newElement);
	}

	attach(newElement) {
		if (this.root.firstElementChild) {
			this.root.replaceChild(newElement, this.root.firstElementChild);
		} else {
			this.root.insertAdjacentElement('afterbegin', newElement);
		}
	}

	remove(id) {
		fetch(`/remove?id=${id}`)
			.then(_ => this.render())
			.catch(e => console.error(e));
	}

	add(newRepo) {
		this.repoList.push(newRepo);
		fetch('/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(newRepo)
		})
			.then(_ => this.render())
			.catch(e => console.error(e));
	}

	updateRow(id, key, value) {
		fetch('/updateOne', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({ id, key, value })
		})
			.then(_ => this.render())
			.catch(e => console.error(e));
	}

	openCmd(dir) {
		fetch('/openCmd', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({ dir })
		})
			.then(_ => {})
			.catch(e => console.error(e));
	}
}
