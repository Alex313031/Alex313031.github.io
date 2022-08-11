#!/usr/bin/env python

import csv
import io
import os
import requests

def main():
    roids = {}

    print ('Loading DAMIT database...')
    damit_database = requests.get('http://astro.troja.mff.cuni.cz/projects/asteroids3D/php/db_export_extended.php').text

    reader = csv.DictReader(io.StringIO(damit_database))
    for row in reader:
        name = row['asteroid name'] or row['asteroid designation']
        if name not in roids:
            # Only take the first one (seems to be the better one).
            roids[name] = (row['asteroid id'], row['model id'])

    try:
        os.makedirs('./damit_scrape')
    except OSError as ex:
        if ex.errno != 17:
            raise ex

    for name, ids in roids.iteritems():
        asteroid_id = ids[0]
        model_id = ids[1]
        path = './damit_scrape/%s.txt' % (name)
        if os.path.isfile(path):
            print ('Skipping'), name, asteroid_id, model_id
            continue

        print ('Downloading'), name, asteroid_id, model_id
        r = requests.get('http://astro.troja.mff.cuni.cz/projects/asteroids3D/php/obj.txt.php?asteroid_id=%s&model_id=%s' % (asteroid_id, model_id))
        with open(path, 'w') as f:
            f.write(r.text)

if __name__ == '__main__':
    main()
