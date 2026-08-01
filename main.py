def welcome():
    print("🌱 Florida Native Garden Manager")
    print("--------------------------------")
    print()

def add_plant():
    common_name = input("Common name? ")
    scientific_name = input("Scientific name? ")
    date_obtained = input("Date obtained? ")
    source_nursery = input("Where is this plant from? ")
    cost = input("How much did it cost? ")
    location = input("Where is this plant located? ")

    plant = {
        "common_name": common_name,
        "scientific_name": scientific_name,
        "date_obtained": date_obtained,
        "source": source_nursery,
        "cost": cost,
        "location": location
    }

    print()
    print("Plant Added:")
    print("----------------")
    print(plant)

def main():
    welcome()
    add_plant()


main()