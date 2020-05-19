var __PDF_DOC,
	__CURRENT_PAGE,
	__TOTAL_PAGES,
	__PAGE_RENDERING_IN_PROGRESS = 0,
	__CANVAS = $('#preview').get(0),
	__CANVAS_CTX = __CANVAS.getContext('2d');

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
	//Выводим в формат png
	fileTemp = __CANVAS.toDataURL('image/png');
	console.log(fileTemp);
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
	showPDF(URL.createObjectURL(inputData.files[0]));
}

function showPDF(pdf_url) {
	PDFJS.getDocument({ url: pdf_url }).then(function(pdf_doc) {
		__PDF_DOC = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;
		
		// Вывод количества страниц всего
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		// Показываем первую страницу
		showPage(1);
	}).catch(function(error) {
		alert(error.message);
	});;
}

function showPage(page_no) {
	__PAGE_RENDERING_IN_PROGRESS = 1;
	__CURRENT_PAGE = page_no;

	// Обновляем номер страницы
	$("#pdf-current-page").text(page_no);
	
	__PDF_DOC.getPage(page_no).then(function(page) {
		//viewport устанавливает качество конечного изображения
		var viewport = page.getViewport(6);
		__CANVAS.width = viewport.width;
		__CANVAS.height = viewport.height;
		__CANVAS.style.width = "45%";

		var renderContext = {
			canvasContext: __CANVAS_CTX,
			viewport: viewport
		};
		
		page.render(renderContext).then(function() {
			__PAGE_RENDERING_IN_PROGRESS = 0;
		});
	});
}

// Предыдущая страница
$("#pdf-prev").on('click', function() {
	if(__CURRENT_PAGE != 1)
		showPage(--__CURRENT_PAGE);
});

// Следующая страница
$("#pdf-next").on('click', function() {
	if(__CURRENT_PAGE != __TOTAL_PAGES)
		showPage(++__CURRENT_PAGE);
});