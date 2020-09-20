import List from './List';

const list = new List('list-container', 'repo-table-tpl');

document.querySelector('[data-add-repo-form]').addEventListener('submit',(e) => {
	e.preventDefault();

	const nameInput = document.querySelector('[data-add-repo-name]')
	const dirInput = document.querySelector('[data-add-repo-dir]')
	
	// get data from inputs
	const newRepo = {
		name: nameInput.value.trim(),
		dir: dirInput.value.trim(),
		branch: '',
		id: Date.now()
	}

	// clear inputs
	nameInput.value = '';
	dirInput.value = '';

	// send data
	list.add.call(list, newRepo);
});

document.querySelector('[data-btn-refresh]').addEventListener('click',(e) => {
	e.preventDefault();
	list.update.call(list, true);
});

const fiveMinutes = 300000 ;

setInterval(() => {
	list.update.call(list, true);
}, fiveMinutes);
