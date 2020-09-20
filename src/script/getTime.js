import geTime from './getTime';
export default function getTime() {
	const today = new Date();
	const month = today.getMonth()+1
	const date = `${today.getFullYear()}.${month >= 10 ? month : (0 + String(month))}.${today.getDate()}`;
	const time = `${today.getHours()}:${today.getMinutes()}`;
	return `${date} ${time}`;
}
