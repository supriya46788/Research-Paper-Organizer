document.querySelectorAll('.tooltip-container').forEach(container => {
  const tooltip = container.querySelector('.tooltip-text');
  
  // Example: show tooltip on click for 2 seconds
  container.addEventListener('click', () => {
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
    setTimeout(() => {
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    }, 2000);
  });
});