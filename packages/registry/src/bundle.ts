import { appendCwd, dirExists, logger } from "../deps.ts";

const toReplaceId = `%SCRIPT_NAME%`;
const toReplacePortId = `%PORT%`;

export const bundle = async (scriptName: string, portName: number) => {
  const toBundlePath = appendCwd(`/toBundle.ts`);

  if (!dirExists(appendCwd(`/registry_in/${scriptName}`))) {
    throw new Error(`Function ${scriptName} does not exist.`);
  }

  const bundlerFile = Deno.readTextFileSync(
    appendCwd(`/packages/templates/bundle.ts`),
  ).replaceAll(toReplaceId, scriptName).replaceAll(
    toReplacePortId,
    `${portName}`,
  );

  Deno.writeTextFileSync(toBundlePath, bundlerFile);

  try {
    await runBundle(toBundlePath, appendCwd(`/registry/${scriptName}.js`))
      .status();
    logger.system("Registry", `Successfully registered ${scriptName}`);
  } finally {
    // Clean up
    Deno.removeSync(toBundlePath);
  }
};

const runBundle = (toBundlePath: string, scriptPath: string) =>
  Deno.run({
    cmd: [
      "time",
      "deno",
      "bundle",
      toBundlePath,
      scriptPath,
    ],
  });