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
	//fileTemp = input.files[0];
	//let imageData = __CANVAS_CTX.getImageData(60, 60, 200, 100);
	//__CANVAS_CTX.putImageData(imageData, 150, 10);
	fileTemp = __CANVAS.toDataURL('image/png');
	//fileTemp = __CANVAS_CTX.getImageData(0, 0, __CANVAS.width, __CANVAS.height);
	console.log(fileTemp);
	//console.log(Buffer.from(fileTemp));
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
    //document.getElementById('preview').src = window.URL.createObjectURL(inputData.files[0]);
	showPDF(URL.createObjectURL(inputData.files[0]));
}

function showPDF(pdf_url) {
	//$("#pdf-loader").show();

	PDFJS.getDocument({ url: pdf_url }).then(function(pdf_doc) {
		__PDF_DOC = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;
		
		// Hide the pdf loader and show pdf container in HTML
		//$("#pdf-loader").hide();
		//$("#pdf-contents").show();
		//$("#pdf-total-pages").text(__TOTAL_PAGES);

		// Show the first page
		showPage(20);
	}).catch(function(error) {
		// If error re-show the upload button
		//$("#pdf-loader").hide();
		//$("#upload-button").show();
		
		alert(error.message);
	});;
}

function showPage(page_no) {
	__PAGE_RENDERING_IN_PROGRESS = 1;
	__CURRENT_PAGE = page_no;

	// Disable Prev & Next buttons while page is being loaded
	//$("#pdf-next, #pdf-prev").attr('disabled', 'disabled');

	// While page is being rendered hide the canvas and show a loading message
	//$("#pdf-canvas").hide();
	//$("#page-loader").show();
	//$("#download-image").hide();

	// Update current page in HTML
	//$("#pdf-current-page").text(page_no);
	
	// Fetch the page
	__PDF_DOC.getPage(page_no).then(function(page) {
		// As the canvas is of a fixed width we need to set the scale of the viewport accordingly
		var scale_required = __CANVAS.width / page.getViewport(2).width;
		console.log(scale_required);
		// Get viewport of the page at required scale
		//var viewport = page.getViewport(scale_required);
		var viewport = page.getViewport(6);
		//__CANVAS.height = 600;
		//__CANVAS.width = 400;
		__CANVAS.width = viewport.width;
		// Set canvas height
		__CANVAS.height = viewport.height;
		__CANVAS.style.width = "45%";

		var renderContext = {
			canvasContext: __CANVAS_CTX,
			viewport: viewport
		};
		
		// Render the page contents in the canvas
		page.render(renderContext).then(function() {
			__PAGE_RENDERING_IN_PROGRESS = 0;

			// Re-enable Prev & Next buttons
			//$("#pdf-next, #pdf-prev").removeAttr('disabled');

			// Show the canvas and hide the page loader
			//$("#pdf-canvas").show();
			//$("#page-loader").hide();
			//$("#download-image").show();
		});
		//__CANVAS.height = 600;
		//__CANVAS.width = 400;
	});
}