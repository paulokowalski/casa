import React from 'react';
import { Card } from "primereact/card";

interface CardProps {
    title: string;
    content: string;
    backGroundColor: string;
  }

const CardPeronalizado: React.FC<CardProps> = ({ title, content, backGroundColor }) => {

    function mudarBackGround(value:string){
        const cardStyle = {
            backgroundColor: 'var(--'+value+')',
            borderRadius: 'var(--border-radius)',
            color: '#fff'
        };
        return cardStyle;
    }



    return (
        <Card title={title} className="md:w-25rem" style={mudarBackGround(backGroundColor)}>
            <h1>
                {content}
            </h1>
        </Card>
    )
}
export default CardPeronalizado;