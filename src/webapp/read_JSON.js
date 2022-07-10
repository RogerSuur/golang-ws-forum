export async function getJSON(path) {
    const data = await fetch(`${path}`)
    .then(response => {
            if (response.ok) return response.json()
            throw Error(response.statusText)
        })
    .then(result => {
            if (result.error) throw Error(result.error)
            return result.posts
        })
    .catch(error => {throw error})
    return data
}