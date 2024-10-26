//Fibonacci Numbers Benchmarking (Original by github.com/Softwave)
//Node.Js version by github.com/DrazoxXD
//I don't know if this kind of math is really okay or not!
//Math is not my strongest skill that's for sure!
//Maxed out it dose not use any CPU so i wouldnt call it a benchmark!

process.stdout.write('\033c'); // CLearing console (works on windows)
const args = process.argv.slice(2);

//Debug stuff
//console.log("Given number for calculation:", args[0]);
//console.log("Given iterations number:", args[1]);

const limit = parseInt(args[0]);
let totalDuration = BigInt(0);
let iterations = 10;

//Checking for user errors
if (args[0] === undefined || limit <= 0) {
    console.log('Number for calculation is either missing or zero!');
    process.exit(-1);
}

if (args[1] === undefined || parseInt(args[1], 10) <= 0) {
    console.log('Number for iterations is missing or zero! Using Default 10');
} else {
    iterations = parseInt(args[1], 10);
}

if (args.length === 0) {
    console.log("Improper input. node file.js number iterations(number)");
    process.exit(-1);
}

const loadingSpinner = () => { //You don't need this then fuck you! I like this!
    const spinnerChars = ['|', '/', '-', '\\'];
    let index = 0;
    return setInterval(() => {
        process.stdout.write(`\rCalculating... ${spinnerChars[index]}`);
        index = (index + 1) % spinnerChars.length;
    }, 100);
};

const fibonacci = (n) => {
    let a = BigInt(0);
    let b = BigInt(1);
    let c;

    for (let i = 0; i < n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    return a;
};

console.log(`Benchmarking Fibonacci calculation for limit: ${limit}`);
console.log(`Number of iterations: ${iterations}`);

const runCalculations = () => {
    let spinner = loadingSpinner();
    let i = 0;

    const calculate = () => {
        const startTime = process.hrtime();

        fibonacci(limit); 

        const endTime = process.hrtime(startTime);
        const timeTaken = BigInt(endTime[0]) * BigInt(1e9) + BigInt(endTime[1]); //Convert to nanoseconds
        totalDuration += timeTaken;

        i++;

        if (i < iterations) {
            setImmediate(calculate);
        } else {
            clearInterval(spinner);
            process.stdout.write('\r');

            // Print results
            const averageDuration = totalDuration / BigInt(iterations);
            console.log(`\nResults:`);
            console.log(`Total Time: ${totalDuration / BigInt(1e6)} ms`);
            console.log(`Average Time: ${averageDuration / BigInt(1e6)} ms`); //Convert to milliseconds
        }
    };

    calculate();
};

runCalculations();