import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import List from './components/List/List';
import store from './utils/store';
import StoreApi from './utils/storeApi';
import { makeStyles } from '@material-ui/core/styles';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TopBar from './components/TopBar';
import SideMenu from './components/SideMenu';
import MapCard from './components/MapCard';
import axios from 'axios';
import Geocode from 'react-geocode';
import {Marker} from 'google-maps-react';

const useStyle = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    width: '100%',
    overflowY: 'auto',
  },
  listContainer: {
    display: 'flex',
  },
}));
var flag = 0;

Geocode.setApiKey('AIzaSyDLTqNLX9015_waYN7su_aK_OgZIu3g5Fk');
Geocode.enableDebug();
Geocode.setRegion("kr");
  
//var locations = [{ name: "", location: { lat: 33.365, lng: 126.56}}];

//var locations = [{ name: "", location: { lat: 33.365, lng: 126.56}}];

export default function TravelPage() {
  
  
  const [card, setCard] = useState([]);
  const [data, setData] = useState(store);
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([{ name: "", location: { lat: 33.365, lng: 126.56}}]);
  

  useEffect(()=> {
    axios
        .get('http://192.249.18.249:3000/getaewol/')
        .then(response => setCard(response.data)) 
    console.log("getaewol");
  }, []);

  useEffect(()=>{
    const list = data.lists['list-2']
    console.log(card);
    var i;
    for(i=0;i<card.length;i++){
        list.cards[i] = card[i];
        list.cards[i].id = 'card-' + i;
    }
  }, []);

  const [backgroundUrl, setBackgroundUrl] = useState('');
  const classes = useStyle();


  const GoogleMap = async (currentAddr) => {
    return Geocode.fromAddress(currentAddr)
      .then( response => {
        const { lat, lng } = response.results[0].geometry.location;
        return {lat, lng}
      })
      .catch(err => console.log(err))
  }

  

  const googloe = async(currentAddr)=>{
    const {lat, lng} = await GoogleMap(currentAddr);
    const tmplocation = {name : "", location:{lat:lat, lng: lng}}
     // locations.location = {lat : lat, lng : lng}
     // locations.push({name : "", location: {lat:lat, lng :lng}});
     //locations = { name: "", location: { lat: lat, lng: lng},};
      // locations.name = "";
      // locations.location = { lat: lat, lng: lng};
    setLocations([...locations, tmplocation]);
     //= { name: "", location: { lat: lat, lng: lng},}
    console.log("setstate")
    console.log(locations);
  }


  const addMoreCard = (title, listId) => {
    console.log(title, listId);

    
    const newCardId = uuid();
    const newCard = {
      id: newCardId,
      title,
    };
    

    const list = data.lists[listId];
    list.cards = [...list.cards, newCard];

    const newState = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: list,
      },
    };
    setData(newState);
  };

  const addMoreList = (title) => {
    const newListId = uuid();
    const newList = {
      id: newListId,
      title,
      cards: [],
    };
    const newState = {
      listIds: [...data.listIds, newListId],
      lists: {
        ...data.lists,
        [newListId]: newList,
      },
    };
    setData(newState);
  };

  const updateListTitle = (title, listId) => {
    const list = data.lists[listId];
    list.title = title;

    const newState = {
      ...data,
      lists: {
        ...data.lists,
        [listId]: list,
      },
    };
    setData(newState);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
    console.log('destination', destination, 'source', source, draggableId);

    if (!destination) {
      return;
    }
    if (type === 'list') {
      const newListIds = data.listIds;
      newListIds.splice(source.index, 1);
      newListIds.splice(destination.index, 0, draggableId);
      return;
    }

    const sourceList = data.lists[source.droppableId];
    const destinationList = data.lists[destination.droppableId];
    const draggingCard = sourceList.cards.filter(
      (card) => card.id === draggableId
    )[0];

    if (source.droppableId === destination.droppableId) {
      sourceList.cards.splice(source.index, 1);
      destinationList.cards.splice(destination.index, 0, draggingCard);
      const newSate = {
        ...data,
        lists: {
          ...data.lists,
          [sourceList.id]: destinationList,
        },
      };
      setData(newSate);
    } else {
      sourceList.cards.splice(source.index, 1);
      destinationList.cards.splice(destination.index, 0, draggingCard);
      const currentAddr = "제주" + draggingCard.contentname;
//
      
      googloe(currentAddr);
       const newState = {
        ...data,
        lists: {
          ...data.lists,
          [sourceList.id]: sourceList,
          [destinationList.id]: destinationList,
        },
      };
      setData(newState);
    }
  };



  return (
    <StoreApi.Provider value={{ addMoreCard, addMoreList, updateListTitle }}>
      <div
        className={classes.root}
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <TopBar setOpen={setOpen} />
        <MapCard  locationarray = {locations}/>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="app" type="list" direction="horizontal">
            {(provided) => (
              <div
                className={classes.listContainer}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {data.listIds.map((listId, index) => {
                  const list = data.lists[listId];
                  console.log("check refresh")
                  if(listId === 'list-2' && flag !==4){
                    var i;
                    for(i=0;i<card.length;i++){
                        list.cards[i] = card[i];
                        list.cards[i].id = 'card-' + i;
                    }
                    flag += 1;
                  }
                  return <List className="list" list={list} key={listId} index={index} />;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <SideMenu
          setBackgroundUrl={setBackgroundUrl}
          open={open}
          setOpen={setOpen}
        />
      </div>
    </StoreApi.Provider>
  );
}