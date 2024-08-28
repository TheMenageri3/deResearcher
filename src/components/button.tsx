type ButtonProps = {
  name: string;
  action: () => void;
};
export const Button = ({ name, action }: ButtonProps) => {
  return (
    <button
      className={`bg-primary text-white text-sm  font-bold py-2 px-4 rounded w-fit transition duration-150 ease-out hover:ease-in hover:scale-[0.9] `}
      onClick={action}
    >
      {name}
    </button>
  );
};
