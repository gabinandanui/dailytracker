let counter = 0;

// Generates a unique ID combining timestamp and counter
export function generateId() {
  const timestamp = Date.now();
  counter = (counter + 1) % 1000; // Reset at 1000 to keep numbers small
  return `${timestamp}-${counter}`;
}