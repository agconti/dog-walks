
function makeIterator(array){
    let nextIndex = 0;

    const next = () => {
      const item = array[nextIndex % array.length]
      nextIndex++

      return item
    }

    return { next }
}

export const dogGifs = [
  'xULW8LkCv9QJMhyT7O',
  '3og0INJHs40dal3F0A',
  '26hlRAfYGFhM88uDm',
  'sMaW02wUllmFi',
  '3oFzm6qEyneSv768Ny',
  'WaDRFTy80J8u4',
  'tdWsWGFHlW6as'
]

const dogGifsIterator = makeIterator(dogGifs)
export const dogGifsFactory = () => `https://media.giphy.com/media/${dogGifsIterator.next()}/giphy.webp`
