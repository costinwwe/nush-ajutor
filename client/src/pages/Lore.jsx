import React from 'react';

const Lore = () => {
  return (
    <div className="lore-container">
      <div className="lore-header">
        <h1>THE DARK FANTASY WORLD</h1>
        <p>Explore the mythology behind our collections</p>
      </div>
      
      <div className="lore-content">
        <div className="lore-section">
          <h2>THE ECLIPSE</h2>
          <div className="lore-text">
            <p>
              In a world torn between light and shadow, the Eclipse represents the moment 
              when darkness consumes all. It is said that during this supernatural event, 
              the boundary between realms dissolves, allowing demons to manifest in our world.
            </p>
            <p>
              Those who survive the Eclipse are forever marked, their destinies intertwined 
              with forces beyond mortal comprehension. The Brand of Sacrifice is a symbol 
              of those who have faced this darkness and lived to tell the tale.
            </p>
          </div>
          <div className="lore-image placeholder-bg"></div>
        </div>
        
        <div className="lore-section reverse">
          <h2>THE BERSERKER ARMOR</h2>
          <div className="lore-text">
            <p>
              Forged in ancient times by dwarf blacksmiths, the Berserker Armor is a cursed 
              suit of armor that removes the limitations of the human body. The wearer feels 
              no pain and can fight beyond human limitations, but at a terrible cost.
            </p>
            <p>
              The armor slowly consumes its wearer, drawing out their inner beast and 
              driving them to madness. It is said that no wearer of the armor has ever 
              died peacefully, but rather in the throes of battle, consumed by rage.
            </p>
          </div>
          <div className="lore-image placeholder-bg"></div>
        </div>
        
        <div className="lore-section">
          <h2>THE BEHELIT</h2>
          <div className="lore-text">
            <p>
              Known as the Egg of the King, the Behelit is a mysterious artifact that serves 
              as a key between worlds. In times of great despair, when its owner has reached 
              the depths of suffering, the Behelit activates.
            </p>
            <p>
              Its features rearrange to form a face, and it weeps tears of blood. At this moment, 
              the God Hand appears, offering a choice: sacrifice what you love most for power 
              beyond human comprehension, or continue to suffer as a mere mortal.
            </p>
          </div>
          <div className="lore-image placeholder-bg"></div>
        </div>
      </div>
    </div>
  );
};

export default Lore; 