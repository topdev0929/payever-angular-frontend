const elementsToColorChange: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('set-color') as HTMLCollectionOf<HTMLElement>;
const colorInput: HTMLInputElement = document.getElementById('input-color') as HTMLInputElement;

const setFontColor = (element:HTMLElement): void => {
  if (
    parseInt('0x' + colorInput.value.slice(1, 3)) >= 209 &&
    parseInt('0x' + colorInput.value.slice(3, 5)) >= 209
  ) {
    element.classList.toggle('black', true);
  } else {
    element.classList.toggle('black', false);
  }
}

export const setColors = (): void => {
  colorInput.addEventListener('input', () => {
    [...elementsToColorChange].forEach((element) => {
      element.style.backgroundColor = colorInput.value;
      setFontColor(element);
    });
  });
}