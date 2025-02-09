export const setCorner = (corner : cornerType = 'pill'): void => {
  const cornerElements: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName("set-corner") as HTMLCollectionOf<HTMLElement>;

  [...cornerElements].forEach((el) => {
    el.classList.remove("sharp", "rounded", "pill");
    el.classList.add(corner);
  });

  (document.getElementById("corner-img") as HTMLImageElement).src = `../../assets/${corner}-corner-icon.svg`;
};

export type cornerType = 'pill' | 'rounded' | 'sharp';