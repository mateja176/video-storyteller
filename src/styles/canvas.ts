type GetReferencePointStyle = (
  color: React.CSSProperties['color'],
) => React.CSSProperties;

export const createReferencePointStyle: GetReferencePointStyle = color => ({
  height: '100%',
  background: `linear-gradient(90deg, transparent 0%, transparent 50%, ${color} 50%, ${color} 51%, transparent 51%, transparent 100%),
               linear-gradient(0deg, transparent 0%, transparent 50%, ${color} 50%, ${color} 51%, transparent 51%, transparent 100%)`,
  backgroundSize: '60px 60px',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
});
