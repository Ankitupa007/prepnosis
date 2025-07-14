export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const renderBoldText = (text: string) => {
  const boldText = text?.replace(
    /\*(.*?)\*/g,
    '<strong class="font-bold">$1</strong>'
  );
  return <span dangerouslySetInnerHTML={{ __html: boldText }} />;
};
