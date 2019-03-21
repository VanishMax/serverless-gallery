const bucketLink = "http://serverlessgallery.s3.amazonaws.com/";
let photos = [];
let isDelete = false;
let isGalleryOpened = false;
let clickedFilename = "";

const handleDeleteButton = () => {
  let cards = document.getElementsByClassName("card");
  for(let card of cards) {
    if(isDelete) {
      card.classList.replace("card-overlay-red", "card-overlay-black");
    } else {
      card.classList.replace("card-overlay-black", "card-overlay-red");
    }
  }
  isDelete = !isDelete;
};

// Listen to clicks for dynamically added elements
document.addEventListener('click', (event) => {
  var elem = event.target;

  // Click at the photo overlay or the overlay text
  if((elem.classList.contains("card-img-overlay") || elem.classList.contains("card-text"))) {

    // Extract the name of the file from special attribute
    if (elem.classList.contains("card-img-overlay")) {
      clickedFilename = elem.getElementsByClassName("card-text")[0].getAttribute("data-file");
    } else if (elem.classList.contains("card-text")) {
      clickedFilename = elem.getAttribute("data-file");
    }

    // If delete - open deletion modal
    if (isDelete) {
      let modal = document.getElementById("deleteModal");
      modal.classList.remove("hidden");

      // If not delete - open gallery modal
    } else {
      let modal = document.getElementById("galleryModal");
      modal.getElementsByClassName("galleryModalImg")[0].src = bucketLink + clickedFilename;
      modal.getElementsByClassName("imgModalName")[0].innerText = clickedFilename.match(/CSVs\/(.+)\./i)[1];
      isGalleryOpened = clickedFilename;
      modal.classList.remove("hidden");
    }

    // Close galleryModal after clicking at the !image || !capture
  } else if(isGalleryOpened && (elem.id === "galleryModal" || elem.classList.contains("photoContent")
    || elem.classList.contains("text-white"))) {
    isGalleryOpened = false;
    document.getElementById("galleryModal").classList.add("hidden");

    // Click at the element that can close the deletion modal
  } else if(!document.getElementById("deleteModal").classList.contains("hidden")
    && elem.id === "deleteModal" || elem.classList.contains("closeModal")) {
    document.getElementById("deleteModal").classList.add("hidden");

    // Click at the Arrows at the photo gallery
  } else if(isGalleryOpened && elem.classList.contains("arrow")) {
      let modal = document.getElementById("galleryModal");

      let newSrc;
      let photoIndex = photos.indexOf(isGalleryOpened);
      if(elem.classList.contains("rightArrow")) {
        if(photoIndex === photos.length - 1) {
          newSrc = photos[0];
        } else {
          newSrc = photos[photoIndex + 1];
        }
      } else if(elem.classList.contains("leftArrow")) {
        if(photoIndex === 0) {
          newSrc = photos[photos.length - 1];
        } else {
          newSrc = photos[photoIndex - 1];
        }
      }

      isGalleryOpened = newSrc;
      modal.getElementsByClassName("galleryModalImg")[0].src = bucketLink + newSrc;
      modal.getElementsByClassName("imgModalName")[0].innerText = newSrc.match(/CSVs\/(.+)\./i)[1];
    }
});

document.onkeydown = (event) => {
  if(isGalleryOpened && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
    let modal = document.getElementById("galleryModal");

    let newSrc;
    let photoIndex = photos.indexOf(isGalleryOpened);
    if(event.key === "ArrowRight") {
      if(photoIndex === photos.length - 1) {
        newSrc = photos[0];
      } else {
        newSrc = photos[photoIndex + 1];
      }
    } else if(event.key === "ArrowLeft") {
      if(photoIndex === 0) {
        newSrc = photos[photos.length - 1];
      } else {
        newSrc = photos[photoIndex - 1];
      }
    }

    isGalleryOpened = newSrc;
    modal.getElementsByClassName("galleryModalImg")[0].src = bucketLink + newSrc;
    modal.getElementsByClassName("imgModalName")[0].innerText = newSrc.match(/CSVs\/(.+)\./i)[1];

  } else if(isGalleryOpened && event.key === "Escape") {
    isGalleryOpened = false;
    document.getElementById("galleryModal").classList.add("hidden");
  }
};

const deleteImage = () => {
  if(clickedFilename) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
      photos.splice(photos.indexOf(clickedFilename), 1);
      clickedFilename = "";
      isDelete = false;
      showGallery();
    };
    xhr.open('DELETE', bucketLink + clickedFilename, true);
    xhr.send(null);
    document.getElementById("deleteModal").classList.add("hidden");
  } else {
    alert("Could not be deleted");
  }
};

const showGallery = () => {
  for(let column of document.getElementsByClassName("gcolumn")) column.innerHTML = "";
  for(let i = 0; i < photos.length; i++) {
    let card = document.createElement("div");
    card.classList.add("card", "text-white", "card-overlay-black");

    let img = document.createElement("img");
    img.classList.add("card-img");

    let overlayText = document.createElement("div");
    overlayText.classList.add("card-img-overlay");

    if(photos[i].startsWith("data")) {
      img.src = photos[i];
      img.alt = "";
      overlayText.innerHTML = `<p class="card-text" data-file=""></p>`;
    } else {
      let name = photos[i].match(/CSVs\/(.+)\./i)[1];
      img.src = bucketLink + photos[i];
      img.alt = name;
      overlayText.innerHTML = `<p class="card-text" data-file="${photos[i]}">${name}</p>`;
    }

    let gcolums = document.getElementsByClassName("gcolumn");
    card.appendChild(img);
    card.appendChild(overlayText);
    gcolums[i % 4].appendChild(card);

  }
};

const handleFileChange = () => {
  let file = document.getElementById("file").files[0];
  if(file.name.length > 34) {
    var extension = file.name.split('.').pop().toLowerCase();
    document.getElementById("keyInput").value = file.name.substr(0, 30) + "." + extension;
    document.getElementById("fileMessage").innerText = file.name.substr(0, 30) + "." + extension;
  } else {
    document.getElementById("keyInput").value = file.name;
    document.getElementById("fileMessage").innerText = file.name;
  }
};

const handleNameKeyUp = () => {
  let extension = document.getElementById("keyInput").value.split('.').pop().toLowerCase();
  let name = event.target.value.replace(/[?\\/%*|:"<>]/gi, "");
  document.getElementById("keyInput").value = name + "." + extension;
};

const handleSubmit = () => {
  event.preventDefault();

  document.getElementById("submitMessage").innerText = "";

  if(photos.length > 30) {
    document.getElementById("submitMessage").innerText = "No way to store more than 30 photos";
  } else {
    let file = document.getElementById("file").files[0];
    if(file) {
      let extension = file.name.split('.').pop().toLowerCase();
      if(extension !== "jpeg" && extension !== "jpg" && extension !== "png" && extension !== "gif") {
        document.getElementById("submitMessage").innerText = "Wrong file type";
      } else if(file.size > 2097152) {
        document.getElementById("submitMessage").innerText = "Big size. Should be less than 2MB";
      } else {

        document.getElementById("keyInput").value = "CSVs/" + document.getElementById("keyInput").value;

        let galleryCell = document.getElementsByClassName("gcolumn")[0];

        let reader = new FileReader();
        reader.onload = () => {
          let filename = reader.result;


          var img = new Image();
          img.onload = () => {
            if(img.height / img.width > 3 || img.width / img.height > 3) {
              document.getElementById("submitMessage").innerText = "Do not even try to upload it!";
            } else {

              photos.unshift(filename);
              showGallery();

              galleryCell.getElementsByClassName("card-text")[0].innerText =
                document.getElementById("keyInput").value.match(/CSVs\/(.+)\./i)[1];
              galleryCell.getElementsByClassName("card-text")[0].setAttribute("data-file", filename.toString());

              document.getElementById("uploadFile").submit();

              // Clear the inputs after submission
              document.getElementById("file").files[0] = null;
              document.getElementById("keyInput").value = "";
              document.getElementById("nameInput").value = "";
            }
          };
          img.src = filename;
        };
        reader.readAsDataURL(file);
      }
    } else {
      document.getElementById("submitMessage").innerText = "No file chosen";
    }
  }
};


window.onload = () => {
  let xhr = new XMLHttpRequest();
  xhr.onload = parsePhotos;
  xhr.open('GET', bucketLink, true);
  xhr.send();
};

function parsePhotos() {
  if(this.status === 200 && this.responseXML != null && this.responseXML.getElementsByTagName('Contents')) {
    let photosXML = this.responseXML.getElementsByTagName("Contents");
    for(let photoXML of photosXML) {
      photos.push(photoXML.childNodes[0].textContent);
    }
    showGallery();
  } else {
    alert('Cannot load the resource');
  }
}
