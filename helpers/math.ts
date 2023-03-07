export function seededRandom(seed: number) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function getRandomNumber() {
    var seed = new Date().getTime();
    var random = seededRandom(seed);
    return random;
}