import 'jasmine';

import { TechTrackStory } from './techtrack';

describe('techtrack', () => {
  it('creates story from message', () => {
    // Create mock message
    const msg: any = {
      cleanContent: '@techtrack can you do my job for me?',
      client: {
        users: {
          cache: [
            { id: '[EliteTerrorist]AbeLincoln', username: '[EliteTerrorist]AbeLincoln' },
          ],
        },
      },
    };

    const story = TechTrackStory.fromMessage(msg);

    expect(story.assignee.id).toMatch(/\[EliteTerrorist\]AbeLincoln/);
    expect(story.description).toEqual('As someone who doesn\'t want to do their job, can you do my job for me?');
    expect(story.id).toMatch(/RAIDARCH01-[1-9]\d\d\d/);
    expect(story.points).toMatch(/2|3|5|8|13/);
  });
});
