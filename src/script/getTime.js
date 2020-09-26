import geTime from './getTime';
export default function getTime() {
	const today = new Date();
	const month = today.getMonth() + 1;
	const minutes = today.getMinutes();
	const hours = today.getHours();
	const date = `${today.getFullYear()}.${month >= 10 ? month : (0 + String(month))}.${today.getDate()}`;
	const time = `${hours >=10 ? hours : (0 + String(hours))}:${minutes >=10 ? minutes : (0 + String(minutes))}`;
	return `${date} ${time}`;
}
