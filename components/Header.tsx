import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-6 no-print">
      <h1 className="text-4xl font-bold text-agoin-light tracking-wider uppercase">
        Registro de Jornada Laboral
      </h1>
      <p className="text-sm text-agoin-light/80 mt-2">
        Registro elaborado de acuerdo a lo establecido en el Art. 12.5 y 34 del Estatuto de los Trabajadores
      </p>
    </header>
  );
};

export default Header;
