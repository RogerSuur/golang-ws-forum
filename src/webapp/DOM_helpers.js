export const createDiv = (className, innerHTML, id) => {
    let div = document.createElement('div');

    if (Array.isArray(className)) {
        className.forEach((className) => {
            div.classList.add(className);
        });
    } else {
        div.classList.add(className);
    }
    
    if (id) {
        div.setAttribute('id', id);
    }

    if (innerHTML) {
        div.innerHTML = innerHTML;
    }
    
    return div;
}

export function horizontalDivider(type) {
    let hr = document.createElement('hr');
    hr.classList.add(type);
    return hr;
}
