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
		id: Date.now(),
		color: 0,
		position: ''
	};

	// clear inputs
	nameInput.value = '';
	dirInput.value = '';

	// send data
	list.add.call(list, newRepo);
});

document.querySelector('[data-btn-refresh]').addEventListener('click',(e) => {
	e.preventDefault();
	list.updateListData.call(list, true);
});

const fiveMinutes = 300000 ;

setInterval(() => {
	list.updateListData.call(list, true);
}, fiveMinutes);

// init feater icons
// https://github.com/feathericons/feather
feather.replace({
	width: 16,
	height: 16,
});