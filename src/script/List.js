import getTime from './getTime';
import throttle from './throttle';
import colors, { getNextColor } from './colors';

export default class List {
	constructor(rootId, templateId) {
		this.templateElement = document.getElementById(templateId);
		this.template = document.importNode(this.templateElement.content, true);
		this.root = document.getElementById(rootId);
		this.repoList = [];
		this.lastUpdate = '';

		this.updateListData(true);
	}

	async updateListData(shouldRenderAfterUpdate) {
		await fetch('/updateAll');
		if (shouldRenderAfterUpdate) {
			this.lastUpdate = getTime();
			this.render();
		}
	}

	async updateListOrder(draggedRowId, closestElementId, position) {
		const repoListNewOrder = [...this.repoList];
		const draggedItemIndex = repoListNewOrder.findIndex(element => {
			return element.id === draggedRowId;
		});
		const closestElementIndex = repoListNewOrder.findIndex(element => {
			return element.id === closestElementId;
		});
		const draggedItem = repoListNewOrder.splice(draggedItemIndex, 1)[0];
		let newIndex;

		if (position === 'below') {
			newIndex = closestElementIndex + 1;
		} else {
			newIndex = closestElementIndex - 1;
		}

		if (newIndex < 0 ) {
			newIndex = 0;
		}

		repoListNewOrder.splice(newIndex, 0, draggedItem);
		const repoListNewOrderMapped = repoListNewOrder.map((item, index) => {
			return {
				...item,
				position: repoListNewOrder.length - index
			};
		});
		const listShort = repoListNewOrderMapped.map(({ id , position }) => {
			return { id, position };
		});

		this.repoList = [...repoListNewOrderMapped];

		fetch('/updateListOrder', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(listShort)
		})
			.then(_ => {})
			.catch(e => console.error(e));
	}

	async render() {
		const newElement = this.template.firstElementChild.cloneNode(true);
		const tableRow = newElement.querySelector('[data-table-row]');
		const tableBody = newElement.querySelector('[data-table-body]');

		const response = await fetch('/getRepoList');
		this.repoList = await response.json();

		for (const repo of this.repoList) {
			// Add rows
			const newRow = tableRow.cloneNode(true);

			newRow.dataset.rowId = repo.id;

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
			tableBody.insertAdjacentElement('beforeend', newRow);
		}

		// Update last update time
		newElement.querySelector('[data-last-update]').textContent = this.lastUpdate;

		// Remove the first table template's row
		tableRow.parentNode.removeChild(tableRow);

		// Attach updated table to the DOM
		this.attach(newElement);

		// init feater icons
		// https://github.com/feathericons/feather
		feather.replace({
			width: 16,
			height: 16,
		});

		this.draggableInit();
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
		// add position number
		newRepo.position = this.repoList.reduce((resultSoFar, item) => {
			const positionNum = Number(item.position);
			if (positionNum >= resultSoFar) {
				return positionNum + 1;
			}
			return resultSoFar;
		}, 1);

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

	draggableInit() {
		const dragHandles = document.querySelectorAll('[data-drag-handle]');
		const draggables = document.querySelectorAll('[data-table-row]');
		const tableBody = document.querySelector('[data-table-body]');
		
		let closestElement;
		let draggedElement;
		let position = 'below';
		let draggableElementsInTable;
		let draggedRowId;

		for (const dragHandle of dragHandles) {
			dragHandle.addEventListener('mouseover', (event) => {
				event.target.closest('[data-table-row]').setAttribute('draggable', true);
			});
			dragHandle.addEventListener('mouseout', (event) => {
				event.target.closest('[data-table-row]').setAttribute('draggable', false)
			});
			dragHandle.addEventListener('dragover', (event) => {
				event.dataTransfer.dropEffect = 'move';
			});
			dragHandle.addEventListener('dragleave', (event) => {
				event.dataTransfer.dropEffect = 'move';
			});
			dragHandle.addEventListener('dragenter', (event) => {
				event.dataTransfer.dropEffect = 'move';
			});
		}

		const dataCells = document.querySelectorAll('[data-cell]');
		for (const dataCell of dataCells) {
			dataCell.addEventListener('dragover', (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
			});
			dataCell.addEventListener('dragenter', (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
			});
			dataCell.addEventListener('dragleave', (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
			});
		}

		for (const draggable of draggables) {
			draggable.addEventListener('dragstart', (event) => {
				event.dataTransfer.effectAllowed = 'move';

				const isDraggable = event.target.closest('[data-table-row]').getAttribute('draggable');
				if (!isDraggable || isDraggable === 'false') {
					event.preventDefault();
					return false;
				}

				draggedRowId = draggable.dataset.rowId;

				draggable.classList.add('dragging');
				draggable.dataset.dragging = true;

				draggableElementsInTable = document
					.querySelectorAll('[data-table-row]:not([data-dragging])');
			});

			draggable.addEventListener('dragend', () => {
				draggable.classList.remove('dragging');
				draggable.removeAttribute('data-dragging');

				this.updateListOrder(
					draggedRowId,
					closestElement.dataset.rowId,
					position
				);

				draggedRowId = null;
				closestElement = null;
				draggedElement = null;
			});

			draggable.addEventListener('dragover', (event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
			});
		}

		tableBody.addEventListener('dragover', throttle(event => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'move';

			const cursorPosition = event.clientY;
			draggedElement = document.querySelector('[data-dragging]');

			let smallestDistance;

			for (const el of draggableElementsInTable) {
				const { height, y } = el.getBoundingClientRect();
				const elPosition =  y + parseInt(height / 2, 10);
				const distanceFromCursor = Math.abs(cursorPosition - elPosition);

				if (typeof smallestDistance === 'undefined' || distanceFromCursor < smallestDistance ) {
					smallestDistance = distanceFromCursor;
					closestElement = el;
			
				}
			}

			const { height, y } = closestElement.getBoundingClientRect();
			const closestElementPosition =  y + parseInt(height / 2, 10);
			if (cursorPosition >= closestElementPosition) {
				position = 'below';
			} else {
				position = 'above';
			}

			if (closestElement) {
				if (position === 'below') {
					closestElement.insertAdjacentElement('afterend', draggedElement);
				} else if (position === 'above') {
					closestElement.insertAdjacentElement('beforebegin', draggedElement);
				}
			}

		}, 200));
	}
}
