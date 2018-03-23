import sys
from uuid import uuid4
from datetime import timedelta
import pandas as pd
import numpy as np
from geopy.distance import vincenty
from geopy.geocoders import Nominatim
ONE_MINUTE_IN_SECONDS = 60
ONE_HOUR_IN_SECONDS = 3600
NEW_WALK_THRESHOLD = timedelta(minutes=15)
geolocator = Nominatim()


def distance_delta(row):
    """
    Calculates the distance in miles between two coordinates.
    """
    latitude = row.latitude
    longitude = row.longitude
    latitude_1 = row.latitude_shift_1
    longitude_1 = row.longitude_shift_1

    if any(map(np.isnan, [latitude, longitude, latitude_1, longitude_1])):
        return np.nan
    return vincenty((latitude, longitude), (latitude_1, longitude_1)).miles


def humanize_timestamp_delta(timestamp):
    """
    Converts timedeltas to a human readable format.
    """
    if pd.isnull(timestamp):
        return None

    total_seconds = int(timestamp.total_seconds())
    hours, remainder = divmod(total_seconds, ONE_HOUR_IN_SECONDS)
    minutes = remainder % ONE_MINUTE_IN_SECONDS
    hour_label = 'hours' if hours > 1 else 'hour'
    minute_label = 'minutes' if minutes > 1 else 'minute'
    return f'{hours} {hour_label} {minutes} {minute_label}'


def humanize_distance_delta(distance, units_label='miles'):
    """
    Converts distances to a human readable format.
    """
    return "{0:.1f} {units_label}".format(distance, units_label=units_label)


def get_street_address(row):
    """
    Returns the row's street address
    """
    latitude = row.latitude
    longitude = row.longitude

    location = geolocator.reverse(f"{latitude}, {longitude}")
    building_number, street = location.address.split(',')[:2]
    return f"{building_number} {street}"


def is_new_walk(row):
    """
    Naively identify new walks by checking if the time passed since the previous
    record is greater then our threshold.
    """
    timestamp_delta = row.timestamp_delta

    if pd.isnull(timestamp_delta):
        return True
    return timestamp_delta > NEW_WALK_THRESHOLD


def give_found_walks_unique_identifiers(df):
    walk_series = []
    walk_slice_pairs = []
    walks = [*df[df.is_new_walk].index, len(df)]
    walks_count = len(walks)

    for index, walk_start in enumerate(walks):
        next_index = index + 1

        if next_index >= walks_count:
            break

        walk_end = walks[next_index]
        walk_slice_pairs.append((walk_start, walk_end))

    for start_index, end_index in walk_slice_pairs:
        walk_record_count = end_index - start_index
        walk_series.append(pd.Series([str(uuid4())], name='walk_id').repeat(walk_record_count))

    pd.concat(walk_series)
    df = df.assign(walk_id=pd.concat(walk_series).values)
    return df


def parse_gps_data(src):
    df = pd.read_csv(src, sep=";", parse_dates=['timestamp'])

    df.sort_values('timestamp', inplace=True)
    df['week_day'] = df.timestamp.dt.weekday_name
    df['timestamp_delta'] = df.timestamp - df.timestamp.shift(1)
    df['latitude_shift_1'] = df.latitude.shift(1)
    df['longitude_shift_1'] = df.longitude.shift(1)
    df['distance_delta'] = df.apply(distance_delta, axis=1)
    df['is_new_walk'] = df.apply(is_new_walk, axis=1)

    df = give_found_walks_unique_identifiers(df)
    return df


def rollup(df):
    """
    Aggregates walk values and adds meta information.
    """
    rollup_columns = ['walk_id', 'distance_delta', 'week_day', 'timestamp_delta']
    meta_information_columns = ['walk_id', 'timestamp', 'latitude', 'longitude']
    column_aggregations = {
        'distance_delta': 'sum',
        'timestamp_delta': 'sum',
        'week_day': 'first',
    }

    rollup = df[rollup_columns].groupby(['walk_id']).agg(column_aggregations)
    rollup['duration'] = rollup['timestamp_delta'].apply(humanize_timestamp_delta)
    rollup['distance'] = rollup['distance_delta'].apply(humanize_distance_delta)
    meta_information = df[df.is_new_walk][meta_information_columns].groupby('walk_id').first()
    meta_information['address'] = meta_information.apply(get_street_address, axis=1)
    rollup = rollup.join(meta_information)
    return rollup


def write_to_json(df, dest):
    columns_to_drop = ['timestamp_delta', 'distance_delta']
    column_names_to_json_keys_map = {
        'walk_id': 'id',
        'timestamp': 'timeStamp'
    }

    output = df.reset_index().drop(columns_to_drop, axis=1).rename(columns=column_names_to_json_keys_map)
    output.sort_values(column_names_to_json_keys_map['timestamp'], inplace=True)
    output.to_json(dest, orient='records')


if __name__ == "__main__":
    source = sys.argv[1]
    destination = sys.argv[2]

    df = parse_gps_data(source)
    rollup = rollup(df)
    write_to_json(rollup, destination)
