// 手写promise.all
function a(promise) {
    let count = 0
    let arr = []
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promise.length; i++) {
            promise[i].then(
                v => {
                    count++
                    arr[i] = v
                    if (count === promise.length) {
                        resolve(arr)
                    }
                },
                r => {
                    reject(r)
                })
        }
    })
}

// 斐波那契数列
function b(n) {
    if (n == 1 || n == 2) {
        return 1
    } else {
        return b(n - 2) + b(n - 1)
    }
}

function c(n) {
    let n1 = 1;
    n2 = 1;
    for (let i = 2; i < n; i++) {
        [n1, n2] = [n2, n1 + n2]
    }
    return n2
}

function d(n) {
    var n1 = 1,
        n2 = 1,
        sum;
    for (let i = 2; i < n; i++) {
        sum = n1 + n2
        n1 = n2
        n2 = sum
    }
    return sum
}