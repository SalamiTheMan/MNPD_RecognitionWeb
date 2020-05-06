function doSubmit()
{
	var prg = document.getElementById('progressbar');
	var st = document.getElementById('status');
	const { createWorker } = Tesseract;  
	const worker = createWorker({
		langPath: '..',
		gzip: false,
		//logger: m => console.log(m)
		logger: m => {
			prg.value = m.progress, 
			st.innerHTML = m.status}
	});
	
	// Храним здесь выбранное изображение
	var fileTemp;
	const input = document.getElementById('file');
	fileTemp = input.files[0];
	if (fileTemp == null)
	{
		alert("Выберите файл");
		return false;
	}
	prg.style.visibility = "visible";
	st.style.visibility = "visible";
	(async () => {
		await worker.load();
		await worker.loadLanguage('result_1000+Cyrillic');
		await worker.initialize('result_1000+Cyrillic');
		const { data: { text } } = await worker.recognize(fileTemp);
		console.log(text);
		document.getElementById('message').value = text.replace(/[ћђ]/g,"ѣ");
		await worker.terminate();
		prg.style.visibility = "hidden";
		st.style.visibility = "hidden";
	})();
}

function fileSelected(inputData)
{
    document.getElementById('preview').src = window.URL.createObjectURL(inputData.files[0])
}




