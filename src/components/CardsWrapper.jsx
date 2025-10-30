import React from 'react'

const CardsWrapper = ({children, customClass="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}) => {
  return (
    <div className={customClass}>
      {children}
    </div>
  )
}

export default CardsWrapper