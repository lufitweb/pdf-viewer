pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

let pdfDoc = null,
    scale = 1.5,
    pdfViewer = document.getElementById('pdf-viewer');

function renderPage(page, pageNumber) {
    const viewport = page.getViewport({scale: scale});
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';
    pageContainer.id = `page-${pageNumber}`;
    pdfViewer.appendChild(pageContainer);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    pageContainer.style.width = `${viewport.width}px`;
    pageContainer.style.height = `${viewport.height}px`;
    pageContainer.appendChild(canvas);

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    
    page.render(renderContext);

    page.getTextContent().then(function(textContent) {
        const textLayer = document.createElement('div');
        textLayer.className = 'text-layer';
        pageContainer.appendChild(textLayer);

        pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayer,
            viewport: viewport,
            textDivs: []
        });
    });
}

function renderAllPages() {
    pdfViewer.innerHTML = ''; // Clear existing content
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        pdfDoc.getPage(pageNum).then(page => renderPage(page, pageNum));
    }
}

function onZoomIn() {
    scale *= 1.2;
    renderAllPages();
    updateZoomLevel();
}

function onZoomOut() {
    scale /= 1.2;
    renderAllPages();
    updateZoomLevel();
}

function updateZoomLevel() {
    document.getElementById('zoom-level').textContent = `${Math.round(scale * 100)}%`;
}

document.getElementById('zoom-in').addEventListener('click', onZoomIn);
document.getElementById('zoom-out').addEventListener('click', onZoomOut);

document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
        console.error('File is not a PDF');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        loadPDF(typedarray);
    };
    fileReader.readAsArrayBuffer(file);
});

function loadPDF(data) {
    pdfjsLib.getDocument(data).promise.then(function(pdf) {
        pdfDoc = pdf;
        renderAllPages();
    });
}

const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
pdfjsLib.getDocument(url).promise.then(function(pdf) {
    pdfDoc = pdf;
    renderAllPages();
});