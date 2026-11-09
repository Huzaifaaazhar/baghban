import { useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import { activeWho, useGame } from '../../store/gameStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SoundControl } from '../ui/SoundControl'

type Confirm = null | 'replay' | 'role' | 'home' | 'rewind'

export function PauseMenu({ open, onClose, onJournal, onInspect }: { open: boolean; onClose: () => void; onJournal: () => void; onInspect: () => void }) {
  const g = useGame()
  const { persona, goTo, replayScene, mode, campaign, rewind } = g
  const [confirm, setConfirm] = useState<Confirm>(null)
  const close = () => { setConfirm(null); onClose() }
  const inCampaign = campaign.stage !== 'off'
  const canRewind = campaign.stage === 'scene' || campaign.stage === 'aftermath'
  const who = activeWho(g)

  const run = (k: Exclude<Confirm, null>) => {
    if (k === 'replay') replayScene()
    if (k === 'role') goTo('role')
    if (k === 'home') goTo('opening')
    if (k === 'rewind') rewind()
    close()
  }

  return (
    <Modal open={open} onClose={close} label="Menu" restoreFocus={false}>
      <div className="p-6 sm:p-8">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-brass">Paused</p>
        <h2 className="font-display text-4xl font-semibold text-cream">Verma Sadan</h2>
        {who && <p className="mt-1 italic text-beige">You are seeing this through {CHARACTERS[who].name}’s eyes.</p>}
        <div className="ornament-rule my-5" />

        {confirm === null ? (
          <div className="flex flex-col gap-3">
            <Button onClick={close}>Resume</Button>
            <Button variant="ghost" onClick={() => { close(); onJournal() }}>Open the journal</Button>
            {inCampaign && <Button variant="ghost" onClick={() => { close(); onInspect() }}>Inspect the household (spoilers)</Button>}
            {canRewind && <Button variant="ghost" onClick={() => setConfirm('rewind')}>Rewind this situation</Button>}
            {!inCampaign && <Button variant="ghost" onClick={() => setConfirm('replay')}>{mode === 'explore' ? 'Replay Sunday Chai' : 'Restart this scene'}</Button>}
            <Button variant="ghost" onClick={() => setConfirm('role')}>{inCampaign ? 'Start over with a different perspective' : 'See it through different eyes'}</Button>
            <Button variant="ghost" onClick={() => setConfirm('home')}>Return to the opening</Button>
            <div className="mt-2 flex justify-center"><SoundControl /></div>
            <p className="text-center text-sm italic text-beige/70">Your progress is saved automatically on this device{persona ? '' : '.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-lg text-cream">
              {confirm === 'replay' && 'Start Sunday Chai again as the same person? Choices you made in this telling will be cleared.'}
              {confirm === 'rewind' && 'Rewind to the start of this situation? The household returns to how it was before; you can choose different eyes or different choices.'}
              {confirm === 'role' && 'Start over from the beginning with a different perspective? The whole year’s progress will be cleared.'}
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
