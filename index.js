//Fibonacci Numbers Benchmarking (Original by github.com/Softwave)
//Node.Js version by github.com/DrazoxXD
//I don't know if this kind of math is really okay or not!
//Math is not my strongest skill that's for sure!

process.stdout.write('\033c'); // Clearing console (works on windows)
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const args = process.argv.slice(2);

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

//Debug stuff
//console.log("Given number for calculation:", args[0]);
//console.log("Given iterations number:", args[1]);

const limit = parseInt(args[0]);
let totalDuration = BigInt(0);
let iterations = 10;
let useThreads = false;
let numThreads = 4; // Default number of threads

if (!isMainThread) {
    const { limit, iterationsPerWorker } = workerData;
    let workerTotalTime = BigInt(0);
    
    for (let i = 0; i < iterationsPerWorker; i++) {
        const startTime = process.hrtime();
        fibonacci(limit);
        const endTime = process.hrtime(startTime);
        const timeTaken = BigInt(endTime[0]) * BigInt(1e9) + BigInt(endTime[1]);
        workerTotalTime += timeTaken;
    }
    
    parentPort.postMessage({ totalTime: workerTotalTime, iterations: iterationsPerWorker });
    return;
}

if (isMainThread) {
    if (args.length === 0) {
        console.log("Improper input. node file.js number iterations(number)");
        process.exit(-1);
    }

    if (args[0] === undefined || isNaN(limit) || limit <= 0) {
        console.log('Number for calculation is either missing or zero!');
        process.exit(-1);
    }

    if (args[1] === undefined || parseInt(args[1], 10) <= 0) {
        console.log('Number for iterations is missing or zero! Using Default 10');
    } else {
        iterations = parseInt(args[1], 10);
    }

    if (args[2] === 'mt' || args[2] === 'true' || args[2] === '1') {
        useThreads = true;
        if (args[3]) {
            if (args[3].toLowerCase() === 'max') {
                const os = require('os');
                numThreads = os.cpus().length - 2; // Leave 2 cores for the OS
                console.log(`Using maximum available threads: ${numThreads}`);
            } else if (parseInt(args[3]) > 0) {
                numThreads = parseInt(args[3]);
            }
        }
    }
}

console.log("Debug - args:", args);
console.log("Debug - parsed limit:", limit);

const loadingSpinner = () => { //You don't need this then fuck you! I like this!
    const spinnerChars = ['|', '/', '-', '\\'];
    let index = 0;
    return setInterval(() => {
        process.stdout.write(`\rCalculating... ${spinnerChars[index]}`);
        index = (index + 1) % spinnerChars.length;
    }, 100);
};

console.log(`Benchmarking Fibonacci calculation for limit: ${limit}`);
console.log(`Number of iterations: ${iterations}`);
if (useThreads) {
    console.log(`Using multi-threading with ${numThreads} threads`);
}

const runMultiThreaded = () => {
    const spinner = loadingSpinner();
    const iterationsPerWorker = Math.ceil(iterations / numThreads);
    let completedWorkers = 0;
    let results = [];
    
    for (let i = 0; i < numThreads; i++) {
        // Adjust iterations for the last worker to prevent excess calculations
        const workerIterations = i === numThreads - 1 
            ? iterations - (iterationsPerWorker * (numThreads - 1)) 
            : iterationsPerWorker;
            
        if (workerIterations <= 0) continue;
        
        const worker = new Worker(__filename, {
            workerData: { 
                limit, 
                iterationsPerWorker: workerIterations 
            }
        });
        
        worker.on('message', (data) => {
            results.push(data);
            completedWorkers++;
            
            if (completedWorkers === numThreads) {
                clearInterval(spinner);
                process.stdout.write('\r');
                
                // Aggregate results
                let totalIterations = 0;
                for (const result of results) {
                    totalDuration += result.totalTime;
                    totalIterations += result.iterations;
                }
                
                // Print results
                const averageDuration = totalDuration / BigInt(totalIterations);
                console.log(`\nResults:`);
                console.log(`Total Time: ${totalDuration / BigInt(1e6)} ms`);
                console.log(`Average Time: ${averageDuration / BigInt(1e6)} ms`);
            }
        });
        
        worker.on('error', (err) => {
            console.error(`Worker error: ${err}`);
        });
    }
};

const runSingleThreaded = () => {
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

if (useThreads) {
    runMultiThreaded();
} else {
    console.log('Using single thread');
    runSingleThreaded();
}
