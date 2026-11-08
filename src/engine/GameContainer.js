import { FlaskContainer } from './FlaskContainer.js';
import { BoxContainer } from './BoxContainer.js';
import { HexagonContainer } from './HexagonContainer.js';

export const ContainerType = {
  FLASK: 'FLASK',
  BOX: 'BOX',
  HEXAGON: 'HEXAGON'
};

export const ContainerMeta = {
  [ContainerType.FLASK]: {
    name: 'Flask',
    icon: '🧪',
    tagline: 'Chemistry Flask with Vertical Neck',
    description: 'Narrow white neck leading into a circular neon chamber. Demands precision dropping!'
  },
  [ContainerType.BOX]: {
    name: 'Box',
    icon: '📦',
    tagline: 'Arcade Rectangular Open Crate',
    description: 'Classic open-top box with wide dropping range and rounded bottom corners.'
  },
  [ContainerType.HEXAGON]: {
    name: 'Hexagon',
    icon: '⬡',
    tagline: 'Cyber Funnel with Sloped Walls',
    description: 'Angled sliding walls guide balls toward the center for rapid chain-reaction merges!'
  }
};

export class ContainerFactory {
  static create(type) {
    switch (type) {
      case ContainerType.BOX:
        return new BoxContainer();
      case ContainerType.HEXAGON:
        return new HexagonContainer();
      case ContainerType.FLASK:
      default:
        return new FlaskContainer();
    }
  }
}
