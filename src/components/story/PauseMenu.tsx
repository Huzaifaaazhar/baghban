import { useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import { useGame } from '../../store/gameStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SoundControl } from '../ui/SoundControl'

export function PauseMenu({ open, onClose, onJournal }: { open: boolean; onClose: () => void; onJournal: () => void }) {
  const { persona, goTo, replayScene, mode } = useGame()
  const [confirm, setConfirm] = useState<null | 'replay' | 'role' | 'home'>(null)
  const close = () => { setConfirm(null); onClose() }

  const run = (k: 'replay' | 'role' | 'home') => {
    if (k === 'replay') replayScene()
    if (k === 'role') goTo('role')
    if (k === 'home') goTo('opening')
    close()
  }

  return (
    <Modal open={open} onClose={close} label="Menu" restoreFocus={false}>
      <div className="p-6 sm:p-8">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-brass">Paused</p>
        <h2 className="font-display text-4xl font-semibold text-cream">Verma Sadan</h2>
        {persona && <p className="mt-1 italic text-beige">You are seeing this through {CHARACTERS[persona].name}’s eyes.</p>}
        <div className="ornament-rule my-5" />

        {confirm === null ? (
          <div className="flex flex-col gap-3">
            <Button onClick={close}>Resume</Button>
            <Button variant="ghost" onClick={() => { close(); onJournal() }}>Open the journal</Button>
            <Button variant="ghost" onClick={() => setConfirm('replay')}>{mode === 'explore' ? 'Replay Sunday Chai' : 'Restart this scene'}</Button>
            <Button variant="ghost" onClick={() => setConfirm('role')}>See it through different eyes</Button>
            <Button variant="ghost" onClick={() => setConfirm('home')}>Return to the opening</Button>
            <div className="mt-2 flex justify-center"><SoundControl /></div>
            <p className="text-center text-sm italic text-beige/70">Your progress is saved automatically on this device.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-lg text-cream">
              {confirm === 'replay' && 'Start Sunday Chai again as the same person? Choices you made in this telling will be cleared.'}
              {confirm === 'role' && 'Choose a different perspective? You will begin the scene again with someone else’s knowledge and burdens.'}
              {confirm === 'home' && 'Go back to the opening? Your progress stays saved — you can continue from there.'}
            </p>
            <Button onClick={() => run(confirm)}>Yes, continue</Button>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Stay here</Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
