import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";

interface ScoreDiffBadgeProps {
  scoreDiff: number;
  className?: string;
}

const ScoreDiffBadge = ({ scoreDiff, className }: ScoreDiffBadgeProps) => {
  return scoreDiff < 0 ? (
    <div className={`flex w-fit items-center space-x-1 rounded-lg ${className}`}>
      <BsCaretDownFill size={15} className="fill-red-400" />
      <h3>{Math.abs(scoreDiff)}</h3>
    </div>
  ) : scoreDiff > 0 ? (
    <div className={`flex w-fit items-center space-x-1 rounded-lg ${className}`}>
      <BsCaretUpFill size={15} className="fill-green-400" />
      <h3>{Math.abs(scoreDiff)}</h3>
    </div>
  ) : null;
};

export default ScoreDiffBadge;
