import geTime from './getTime';
export default function getTime() {
	const today = new Date();
	const day =  today.getDate();
	const month = today.getMonth() + 1;
	const minutes = today.getMinutes();
	const hours = today.getHours();

	const monthStr = month >= 10 ? month : '0' + String(month)
	const hoursStr = hours >=10 ? hours : '0' + String(hours);
	const minutesStr = minutes >=10 ? minutes : '0' + String(minutes);
	const dayStr = day >= 10 ? day : '0' + String(day);

	const date = `${today.getFullYear()}.${monthStr}.${dayStr}`;
	const time = `${hoursStr}:${minutesStr}`;

	return `${date} ${time}`;
}
