import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

async function runTests(
  nodeOptions: string[] = [],
  program = "node",
  programOptions: string[] = [],
  env: Record<string, string> = {}
): Promise<void> {
  const time = Date.now();

  // Initialize the Pocketbase client for the adapter and define the API URL
  console.log("🚀 Initializing Pocketbase client...");
  exec(
    `chmod +x ${process.cwd()}/pocketbase/startPb.sh && ${process.cwd()}/pocketbase/startPb.sh &> /dev/null`,
    (err, stdout, stderr) => {
      if (err) {
        throw new Error(`🚨 Error starting Pocketbase server: ${err}`);
      }

      if (stderr) {
        throw new Error(`🚨 Error starting Pocketbase server: ${stderr}`);
      }
    }
  );

  // Sleep for 60 seconds to allow the Pocketbase server to start
  console.log("⏳ Waiting for Pocketbase server to start...");
  await new Promise((resolve) => setTimeout(resolve, 60000));

  return new Promise((resolve, reject) => {
    console.log("🧪 Running tests...");
    const nodeProcess = spawn(
      program,
      [
        ...programOptions,
        "--disable-warning=ExperimentalWarning",
        "--experimental-strip-types",
        "--test",
        ...nodeOptions,
        "src/**/*.test.ts",
      ],
      { stdio: "inherit", env: { ...process.env, ...env } }
    );

    nodeProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ tests passed in ${Date.now() - time}ms`);
        // Kill the Pocketbase server after the tests have passed
        exec(
          `chmod +x ${process.cwd()}/pocketbase/killPb.sh && ${process.cwd()}/pocketbase/killPb.sh &> /dev/null`
        );
        resolve();
      }

      exec(
        `chmod +x ${process.cwd()}/pocketbase/killPb.sh && ${process.cwd()}/pocketbase/killPb.sh &> /dev/null`
      );
      reject(`🚨 tests failed with code ${code} in ${Date.now() - time}ms`);
    });
  });
}

if (process.argv[1] === import.meta.filename) {
  if (process.argv[2] === "test") {
    await runTests();
  }

  if (process.argv[2] === "test:watch") {
    await runTests(["--watch"]);
  }

  if (process.argv[2] === "test:coverage") {
    await runTests(
      ["--experimental-test-coverage"],
      "c8",
      ["-r", "html", "node"],
      {
        NODE_V8_COVERAGE: "./coverage",
      }
    );
  }
}
