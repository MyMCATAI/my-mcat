❌ ✔️
TODO: 
#### AI upgrade - having it so that Kalypso can interrupt a video/reading to ask questions in the ATS to make sure people are paying attention. A sound should notify them,  looks like we’re talking to him instead of a regular chatbot

[❌] keep track of ATS Layout State
[ ] 5 minute inactivity time out tracker - Kalypso interrupt and ask if they need help, triggers beeping timer.
[ ] Add full body Kalypso sprite
[ ] Keep track of user `selected subjects` in zustand store, eventually need to sync this to Prisma. 
    ↳ we refresh ATS - and we get the same 6 subjects at the top, but we are still storing the checkmarked subjects, we should be   
       keeping track of those subjects?  (notes: we store these in `localStorage` in `/AdaptiveTutoring.tsx`)

[ ] Better cmd button integration talking to Kalypso - mic icon should different color during recording - also see a waveform or something glowing 

[ ] Via Prynce - fix Markdown looks bad in Testing Suite - see snapshot
[ ] Via Prynce - be able to scroll down vertically more my-mcat.ai navbar panel - should be off the screen when we scroll all the way down.




ATS TODOS:
[ ] make the "active" tab stand out (1 of the 6 subjects that determine the videos we see ) 

## Finalize Store Migration Progress
[✓] Implemented audioSlice (complete)
[✓] Implemented uiSlice (complete)
[ ] Implement userSlice (files created but not implemented)
[✓ ] Implement gameSlice (files created but not implemented)
[ ] Implement vocabSlice (files created but not implemented)
[ ] CARS Suite - take out sound when you select answer. (Prynce bug)
