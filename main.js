const token = "YOUR TOKEN OF GOOGLE CLOUD"
const bucket = "YOUR BUCKER"
const urlApi = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o`

const fileInp = document.getElementById("fileInp")
fileInp.addEventListener("input", uploadFile)

// Level 1 ---------------------------------------------------------

async function uploadFile() {
    const file = fileInp.files[0]

    const formData = new FormData();
    formData.append("file", file );

    const response = await fetch(
        `${urlApi}?uploadType=media&name=${file.name}`,
        {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
        body: formData,
        }
    );

    alert("Done upload")
}

// Level 2 -------------------------------------------------------------

document.getElementById("btnUp").addEventListener("click", function(){
    fileInp.click()
})

// Level 3 -------------------------------------------------------------

function uploadFileProgress() {
    const file = document.getElementById("fileInp-level3").files[0]

    const formData = new FormData();
    formData.append("file", file );

    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${urlApi}?uploadType=media&name=${file.name}`);

    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", "multipart/form-data");

    xhr.upload.onprogress = (e) => {
        const percentUp = (e.loaded / file.size) * 100;
        console.log(percentUp)
    };
    xhr.onload = function () {
        alert("Done upload")
    };
    xhr.onerror = function () {
        console.log("on error")
    };

    xhr.send(formData);
}

// Level 4 --------------------------------------------------------------
const progress = document.getElementById("progress-level4")

function uploadFileProgressVisual() {
    const file = document.getElementById("fileInp-level4").files[0]

    progress.value = 0;

    const formData = new FormData();
    formData.append("file", file );

    let xhr = new XMLHttpRequest();
    xhr.open('POST', `${urlApi}?uploadType=media&name=${file.name}`);

    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", "multipart/form-data");
    xhr.setRequestHeader("X-Upload-Content-Length", file.size);

    xhr.onload = function () {
        alert("Done upload")
    };
    xhr.onerror = function () {
        console.log("on error")
    };
    xhr.upload.onprogress = (e) => {
        const percentUp = (e.loaded / file.size) * 100;
        progress.value = percentUp
    };

    xhr.send(formData);
}

// Level 5 --------------------------------------------------------------
const progressCtn = document.getElementById("progress-level5-ctn");

async function uploadFilesChunk() {
    const file = document.getElementById("fileInp-level5").files[0]

    progressCtn.innerHTML = ""
    
    const metadata = {
        contentType: file.type,
    };

    // Initiate resumable upload
    const response = await fetch(`${urlApi}?uploadType=resumable&name=${file.name}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": file.size,
        "Origin": "*"
      },
      body: JSON.stringify(metadata), 
    });
  
    if (!response.ok) {
      throw new Error(`Upload initiation failed: ${response.statusText}`);
    }

    const urlUpload = response.headers.get('Location')

    // const chunkSize = 67108864;
    const chunkSize = 1024 * 1024 * 10;

    for (let start = 0; start < file.size; start += chunkSize) {
        const chunk = file.slice(start, start + chunkSize);
        const status = await upChunk(urlUpload, chunk, start, file.size);
        console.log(status)
    }
}

function upChunk(urlUpload, chunk, start, totalSize) {
    const progressBar = document.createElement("input")
    progressBar.type = "range";
    progressBar.min = 0; progressBar.max = 100;
    progressBar.value = 0;
    progressCtn.appendChild(progressBar)

    return new Promise((resolve, reject) => {
        const size = chunk.size;

        let xhr = new XMLHttpRequest();
        xhr.open('PUT', urlUpload);
        xhr.setRequestHeader("X-Upload-Content-Length", `${size}`);
        xhr.setRequestHeader("X-Upload-Content-Range", `bytes ${start} - ${start + size - 1} / ${totalSize}`);

        xhr.onload = function () {
            resolve(this.status);
        };
        xhr.onerror = function () {
            resolve(this.status);
        };

        xhr.upload.onprogress = (e) => {
            const percentUp = (e.loaded / size) * 100;
            progressBar.value = percentUp
        };

        xhr.send(chunk);
    });
}