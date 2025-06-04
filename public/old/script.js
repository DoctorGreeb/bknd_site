// index
const images = [
  "https://png.pngtree.com/thumb_back/fw800/background/20230610/pngtree-picture-of-a-blue-bird-on-a-black-background-image_2937385.jpg",
  "https://png.pngtree.com/thumb_back/fh260/background/20230523/pngtree-woman-in-an-hooded-jacket-and-headphones-image_2688529.jpg"
];

let current = 0;

function showSlide(index) {
  const img = document.getElementById('slide');
  if (img) {
    img.classList.add('fade');
    setTimeout(() => {
      img.src = images[index];
      img.classList.remove('fade');
    }, 500);
  }
}

function nextSlide() {
  current = (current + 1) % images.length;
  showSlide(current);
}

function prevSlide() {
  current = (current - 1 + images.length) % images.length;
  showSlide(current);
}
document.addEventListener('DOMContentLoaded', function () {
console.log("тест")
document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        prevSlide();
        console.log("left");
      } else if (event.key === "ArrowRight") {
        nextSlide();
        console.log("right");
      }
});
});

// slider
const range = document.getElementById('range');
const value = document.getElementById('range-value');
range.addEventListener('input', () => {
  const val = parseInt(range.value);
  value.textContent = val;

  const hue = val * 3.6;

  document.body.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
});

// form
const form = document.getElementById('register-form');
const result = document.getElementById('result');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  result.textContent = 'Регистрация прошла успешно!';
});