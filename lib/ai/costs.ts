/** USD estimate, not a billing invoice. Includes thinking tokens; no cached discount assumed. */
export function estimateProviderMicros(model:string, usage:Record<string,unknown>, at=new Date()):number|null {
  const input=usage.promptTokenCount, output=usage.candidatesTokenCount, thoughts=usage.thoughtsTokenCount??0;
  if (![input,output,thoughts].every(x=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0)) return null;
  if(model.startsWith('groq-free:')||model.startsWith('openrouter-free:'))return 0;
  const rates=model==='gemini-3.1-flash-lite'?[.25,1.5]:model==='gemini-3.8-flash'?(at<new Date('2027-01-01T00:00:00Z')?[.75,3.75]:[1.5,7.5]):null;
  return rates?Math.ceil(Number(input)*rates[0]+(Number(output)+Number(thoughts))*rates[1]):null;
}
