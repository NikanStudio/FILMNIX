const SUPABASE_URL = "https://jklibcbbbzsorbolljlh.supabase.co";
const SUPABASE_KEY = "sb_publishable_H0wqVJ7JZI4PVBeDQr0ZLA_2Jd57NCp";

const supabaseClient = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

// عناصر
const movieForm = document.getElementById("movieForm");
const movieTitle = document.getElementById("movieTitle");
const movieDescription = document.getElementById("movieDescription");
const movieImage = document.getElementById("movieImage");

const imagePreview = document.getElementById("imagePreview");
const uploadText = document.getElementById("uploadText");
const uploadIcon = document.getElementById("uploadIcon");

const movieModal = document.getElementById("movieModal");

const moviesGrid = document.getElementById("moviesGrid");
const emptyState = document.getElementById("emptyState");
const moviesCount = document.getElementById("moviesCount");

const searchInput = document.getElementById("searchInput");
const searchMessage = document.getElementById("searchMessage");

// =====================================
// باز کردن فرم
// =====================================

function openMovieModal() {

movieModal.style.display = "flex";
document.body.style.overflow = "hidden";

}

// =====================================
// بستن فرم
// =====================================

function closeMovieModal() {

movieModal.style.display = "none";
document.body.style.overflow = "";

}

// =====================================
// پیش‌نمایش عکس
// =====================================

movieImage.addEventListener("change", function() {

const file = movieImage.files[0];

if (!file) {
    return;
}

uploadText.textContent = file.name;
uploadIcon.textContent = "✅";

const reader = new FileReader();

reader.onload = function(event) {

    imagePreview.innerHTML =
        `<img src="${event.target.result}" alt="پیش‌نمایش پوستر">`;

    imagePreview.style.display = "block";

};

reader.readAsDataURL(file);

});

// =====================================
// دریافت فیلم‌ها
// =====================================

async function loadMovies() {

const { data, error } = await supabaseClient
    .from("movies")
    .select("id, title, description, image_url, created_at")
    .order("created_at", {
        ascending: false
    });

if (error) {

    console.error(error);

    moviesGrid.innerHTML =
        "<p>خطا در دریافت فیلم‌ها ❌</p>";

    return;
}

renderMovies(data || []);

}

// =====================================
// نمایش فیلم‌ها
// =====================================

function renderMovies(movies) {

moviesGrid.innerHTML = "";

moviesCount.textContent = movies.length;


if (movies.length === 0) {

    emptyState.style.display = "block";

    return;
}

emptyState.style.display = "none";


movies.forEach(movie => {

    const card = document.createElement("div");

    card.className = "movie-card";


    if (movie.image_url) {

        const img = document.createElement("img");

        img.className = "movie-poster";

        img.src = movie.image_url;

        img.alt = movie.title;

        card.appendChild(img);

    } else {

        const noPoster = document.createElement("div");

        noPoster.className = "no-poster";

        noPoster.textContent = "🎬";

        card.appendChild(noPoster);

    }


    const info = document.createElement("div");

    info.className = "movie-info";


    const title = document.createElement("h3");

    title.textContent = movie.title;


    const description = document.createElement("p");

    description.textContent = movie.description;


    info.appendChild(title);

    info.appendChild(description);

    card.appendChild(info);


    moviesGrid.appendChild(card);

});

}

// =====================================
// ثبت فیلم
// =====================================

movieForm.addEventListener("submit", async function(event) {

event.preventDefault();


const title = movieTitle.value.trim();

const description = movieDescription.value.trim();

const file = movieImage.files[0];


if (!title || !description) {

    alert("لطفاً نام فیلم و مشخصات آن را وارد کنید.");

    return;
}


const button =
    movieForm.querySelector("button[type='submit']");


button.disabled = true;

button.textContent = "در حال ثبت...";


let imageUrl = null;


// =================================
// آپلود عکس
// =================================

if (file) {

    const fileExtension =
        file.name.split(".").pop().toLowerCase();

    const fileName =
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2) +
        "." +
        fileExtension;


    const { error: uploadError } =
        await supabaseClient.storage
            .from("movie-posters")
            .upload(fileName, file);


    if (uploadError) {

        console.error(uploadError);

        alert(
            "آپلود پوستر انجام نشد ❌\n\n" +
            uploadError.message
        );

        button.disabled = false;

        button.textContent = "🎬 ثبت فیلم";

        return;
    }


    const { data: publicData } =
        supabaseClient.storage
            .from("movie-posters")
            .getPublicUrl(fileName);


    imageUrl = publicData.publicUrl;

}


// =================================
// ثبت اطلاعات فیلم
// =================================

const { error } = await supabaseClient
    .from("movies")
    .insert({
        title: title,
        description: description,
        image_url: imageUrl
    });


if (error) {

    console.error(error);

    alert(
        "ثبت فیلم انجام نشد ❌\n\n" +
        error.message
    );

    button.disabled = false;

    button.textContent = "🎬 ثبت فیلم";

    return;
}


// پاک کردن فرم

movieForm.reset();

imagePreview.innerHTML = "";

imagePreview.style.display = "none";

uploadText.textContent = "انتخاب پوستر";

uploadIcon.textContent = "🖼️";


button.disabled = false;

button.textContent = "🎬 ثبت فیلم";


closeMovieModal();


await loadMovies();


alert("فیلم با موفقیت ثبت شد ✅");

});

// =====================================
// بستن با کلیک بیرون
// =====================================

movieModal.addEventListener("click", function(event) {

if (event.target === movieModal) {

    closeMovieModal();

}

});

// =====================================
// جستجو
// =====================================

if (searchInput) {

searchInput.addEventListener("input", async function() {

    const text =
        searchInput.value.trim().toLowerCase();


    const { data, error } = await supabaseClient
        .from("movies")
        .select("id, title, description, image_url, created_at")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        return;
    }


    const filtered = (data || []).filter(movie =>

        movie.title.toLowerCase().includes(text) ||
        movie.description.toLowerCase().includes(text)

    );


    renderMovies(filtered);


    if (searchMessage) {

        searchMessage.textContent =
            text
                ? `${filtered.length} فیلم پیدا شد`
                : "";

    }

});

}

// شروع
loadMovies();
