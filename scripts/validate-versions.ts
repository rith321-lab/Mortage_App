import { execSync } from 'child_process';
import { version as processVersion } from 'process';

interface VersionRequirements {
  node: string;
  npm: string;
}

const requiredVersions: VersionRequirements = {
  node: '18.0.0',
  npm: '8.0.0'
};

function compareVersions(current: string, required: string): boolean {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] > requiredParts[i]) return true;
    if (currentParts[i] < requiredParts[i]) return false;
  }
  return true;
}

try {
  // Check Node.js version
  const nodeVersion = processVersion.slice(1); // Remove 'v' prefix
  if (!compareVersions(nodeVersion, requiredVersions.node)) {
    throw new Error(`Node.js version must be >=${requiredVersions.node}`);
  }

  // Check npm version
  const npmVersion = execSync('npm -v').toString().trim();
  if (!compareVersions(npmVersion, requiredVersions.npm)) {
    throw new Error(`npm version must be >=${requiredVersions.npm}`);
  }

  console.log('✅ Environment validation passed:');
  console.log(`Node.js version: ${nodeVersion}`);
  console.log(`npm version: ${npmVersion}`);

} catch (error: any) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
} 