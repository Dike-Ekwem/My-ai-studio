import React from 'react';
import { PlayerState } from '../../types/game';
import { ClassroomScene3D } from './ClassroomScene3D';

interface LectureModalProps {
  player: PlayerState;
  onClose: () => void;
  onCompleteClass: (courseCode: string, scoreGained: number) => void;
}

export const LectureModal: React.FC<LectureModalProps> = ({
  player,
  onClose,
  onCompleteClass
}) => {
  return (
    <ClassroomScene3D
      player={player}
      onClose={onClose}
      onCompleteClass={onCompleteClass}
    />
  );
};
