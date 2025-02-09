/** Uppercase first character */
export function ucfirst(string: string, alternative?:string) {
  if (!string){
    return alternative;
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}
